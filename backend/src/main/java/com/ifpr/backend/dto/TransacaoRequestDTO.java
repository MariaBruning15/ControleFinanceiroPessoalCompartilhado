package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.ifpr.backend.model.enums.TipoTransacao;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransacaoRequestDTO {

    @NotNull(message = "O tipo da transação é obrigatório (INCOME ou EXPENSE).")
    private TipoTransacao type;

    @NotNull(message = "O valor é obrigatório.")
    @Positive(message = "O valor deve ser positivo.")
    private BigDecimal amount;

    private String description;

    @NotNull(message = "A data da transação é obrigatória.")
    private LocalDate date;

    private UUID categoryId;

    public TipoTransacao getType() { return type; }
    public void setType(TipoTransacao type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
}