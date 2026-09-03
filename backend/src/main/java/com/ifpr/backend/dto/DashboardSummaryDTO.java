package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class DashboardSummaryDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private long transactionCount;
    private List<CategorySummaryDTO> byCategory;
    private List<MonthlySummaryDTO> byMonth;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal balance,
                               long transactionCount, List<CategorySummaryDTO> byCategory, List<MonthlySummaryDTO> byMonth) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.transactionCount = transactionCount;
        this.byCategory = byCategory;
        this.byMonth = byMonth;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(long transactionCount) { this.transactionCount = transactionCount; }

    public List<CategorySummaryDTO> getByCategory() { return byCategory; }
    public void setByCategory(List<CategorySummaryDTO> byCategory) { this.byCategory = byCategory; }

    public List<MonthlySummaryDTO> getByMonth() { return byMonth; }
    public void setByMonth(List<MonthlySummaryDTO> byMonth) { this.byMonth = byMonth; }

    public static class CategorySummaryDTO {
        private UUID categoryId;
        private String categoryName;
        private BigDecimal total;

        public CategorySummaryDTO(UUID categoryId, String categoryName, BigDecimal total) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.total = total;
        }

        public UUID getCategoryId() { return categoryId; }
        public String getCategoryName() { return categoryName; }
        public BigDecimal getTotal() { return total; }
    }

    public static class MonthlySummaryDTO {
        private String month;
        private BigDecimal income;
        private BigDecimal expense;

        public MonthlySummaryDTO(String month, BigDecimal income, BigDecimal expense) {
            this.month = month;
            this.income = income;
            this.expense = expense;
        }

        public String getMonth() { return month; }
        public BigDecimal getIncome() { return income; }
        public BigDecimal getExpense() { return expense; }
    }
}