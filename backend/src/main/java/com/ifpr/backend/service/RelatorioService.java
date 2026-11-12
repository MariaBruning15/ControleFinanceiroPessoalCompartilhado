package com.ifpr.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.dto.RelatorioMensalDTO;
import com.ifpr.backend.dto.RelatorioMensalDTO.CategoriaRelatorio;
import com.ifpr.backend.dto.RelatorioMensalDTO.LancamentoRelatorio;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.TransacaoRepository;

@Service
public class RelatorioService {

    private static final String SEM_CATEGORIA = "Sem categoria";
    private static final int MAIORES_DESPESAS = 5;

    private final TransacaoRepository transacaoRepository;
    private final CarteiraRepository carteiraRepository;
    private final CarteiraService carteiraService;

    public RelatorioService(TransacaoRepository transacaoRepository,
                            CarteiraRepository carteiraRepository,
                            CarteiraService carteiraService) {
        this.transacaoRepository = transacaoRepository;
        this.carteiraRepository = carteiraRepository;
        this.carteiraService = carteiraService;
    }

    @Transactional(readOnly = true)
    public RelatorioMensalDTO gerarResumoMensal(UUID carteiraId, UUID usuarioId, YearMonth mes) {
        // Qualquer membro da carteira (inclusive VISUALIZADOR) pode ver o relatório
        carteiraService.validarMembro(carteiraId, usuarioId);

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));

        LocalDate inicio = mes.atDay(1);
        LocalDate fim = mes.atEndOfMonth();
        YearMonth anterior = mes.minusMonths(1);

        List<Transacao> transacoes = transacaoRepository.findTransacoesParaSummary(carteiraId, inicio, fim);

        BigDecimal totalReceitas = somar(transacoes, TipoTransacao.RECEITA);
        BigDecimal totalDespesas = somar(transacoes, TipoTransacao.DESPESA);
        BigDecimal resultadoMes = totalReceitas.subtract(totalDespesas);

        // Saldo no início do mês = saldo inicial da carteira + tudo o que aconteceu antes do mês
        BigDecimal saldoInicialCarteira = carteira.getSaldoInicial() != null ? carteira.getSaldoInicial() : BigDecimal.ZERO;
        LocalDate diaAntes = inicio.minusDays(1);
        BigDecimal saldoInicial = saldoInicialCarteira
                .add(somarPeriodo(carteiraId, TipoTransacao.RECEITA, null, diaAntes))
                .subtract(somarPeriodo(carteiraId, TipoTransacao.DESPESA, null, diaAntes));

        BigDecimal receitasAnterior = somarPeriodo(
                carteiraId, TipoTransacao.RECEITA, anterior.atDay(1), anterior.atEndOfMonth());
        BigDecimal despesasAnterior = somarPeriodo(
                carteiraId, TipoTransacao.DESPESA, anterior.atDay(1), anterior.atEndOfMonth());

        List<LancamentoRelatorio> lancamentos = transacoes.stream()
                .sorted(Comparator.comparing(Transacao::getData))
                .map(this::paraLancamento)
                .toList();

        List<LancamentoRelatorio> maioresDespesas = lancamentos.stream()
                .filter(l -> TipoTransacao.DESPESA.name().equals(l.tipo()))
                .sorted(Comparator.comparing(LancamentoRelatorio::valor).reversed())
                .limit(MAIORES_DESPESAS)
                .toList();

        return new RelatorioMensalDTO(
                carteira.getId(),
                carteira.getNome(),
                mes.toString(),
                Instant.now(),
                saldoInicial,
                totalReceitas,
                totalDespesas,
                resultadoMes,
                saldoInicial.add(resultadoMes),
                transacoes.size(),
                receitasAnterior,
                despesasAnterior,
                agruparPorCategoria(transacoes, totalReceitas, totalDespesas),
                maioresDespesas,
                lancamentos);
    }

    private BigDecimal somarPeriodo(UUID carteiraId, TipoTransacao tipo, LocalDate inicio, LocalDate fim) {
        BigDecimal soma = transacaoRepository.somarPorTipo(carteiraId, tipo, inicio, fim);
        return soma != null ? soma : BigDecimal.ZERO;
    }

    private BigDecimal somar(List<Transacao> transacoes, TipoTransacao tipo) {
        return transacoes.stream()
                .filter(t -> t.getTipo() == tipo && t.getValor() != null)
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoriaRelatorio> agruparPorCategoria(List<Transacao> transacoes,
                                                         BigDecimal totalReceitas,
                                                         BigDecimal totalDespesas) {
        // chave: tipo + categoria, para não misturar receita e despesa da mesma categoria
        record Acumulado(UUID id, String nome, TipoTransacao tipo, BigDecimal total, long quantidade) {
        }

        Map<String, Acumulado> mapa = new LinkedHashMap<>();
        for (Transacao t : transacoes) {
            if (t.getTipo() == null) continue;
            UUID categoriaId = t.getCategoria() != null ? t.getCategoria().getId() : null;
            String nome = t.getCategoria() != null ? t.getCategoria().getNome() : SEM_CATEGORIA;
            BigDecimal valor = t.getValor() != null ? t.getValor() : BigDecimal.ZERO;

            mapa.merge(t.getTipo() + ":" + categoriaId,
                    new Acumulado(categoriaId, nome, t.getTipo(), valor, 1),
                    (a, b) -> new Acumulado(a.id(), a.nome(), a.tipo(), a.total().add(b.total()), a.quantidade() + 1));
        }

        return mapa.values().stream()
                .sorted(Comparator.comparing(Acumulado::tipo).thenComparing(Acumulado::total, Comparator.reverseOrder()))
                .map(a -> new CategoriaRelatorio(
                        a.id(),
                        a.nome(),
                        a.tipo().name(),
                        a.total(),
                        a.quantidade(),
                        percentual(a.total(), a.tipo() == TipoTransacao.RECEITA ? totalReceitas : totalDespesas)))
                .toList();
    }

    private BigDecimal percentual(BigDecimal parte, BigDecimal total) {
        if (total.signum() == 0) return BigDecimal.ZERO;
        return parte.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }

    private LancamentoRelatorio paraLancamento(Transacao t) {
        return new LancamentoRelatorio(
                t.getId(),
                t.getData(),
                t.getDescricao(),
                t.getCategoria() != null ? t.getCategoria().getNome() : SEM_CATEGORIA,
                t.getTipo() != null ? t.getTipo().name() : null,
                t.getValor(),
                t.getCriadoPor() != null ? t.getCriadoPor().getNome() : null);
    }
}
