package com.workhub.backend.dto;

import java.math.BigDecimal;

public record PayrollCreateDto(BigDecimal salary, BigDecimal bonus, BigDecimal deductions, String payDate) {
}
