package com.example.documentorganizer.controller;

import com.example.documentorganizer.dto.AdminReportResponse;
import com.example.documentorganizer.dto.ApiResponse;
import com.example.documentorganizer.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminReportResponse>> getReports() {
        AdminReportResponse report = reportService.generateReport();
        return ResponseEntity.ok(ApiResponse.success("Admin reports generated successfully.", report));
    }
}
