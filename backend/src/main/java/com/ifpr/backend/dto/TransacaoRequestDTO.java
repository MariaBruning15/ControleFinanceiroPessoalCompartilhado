package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;

public class TransacaoRequestDTO {

    @NotNull(message = "O valor é obrigatório.")
    @DecimalMin(value = "0.01", message = "O valor mínimo deve ser 0.01.")
    private BigDecimal amount;

    @NotNull(message = "A data é obrigatória.")
    @PastOrPresent(message = "A data não pode ser futura.")
    private LocalDate date;

    @NotNull(message = "O tipo da transação é obrigatório.")
    @Pattern(regexp = "INCOME|EXPENSE", message = "O tipo deve ser 'INCOME' ou 'EXPENSE'.")
    private String type;

    private String description;

    private UUID categoryId;

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
}