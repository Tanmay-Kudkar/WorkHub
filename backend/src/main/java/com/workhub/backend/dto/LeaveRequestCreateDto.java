package com.workhub.backend.dto;

public record LeaveRequestCreateDto(Long leaveTypeId, String startDate, String endDate, String reason) {
}
