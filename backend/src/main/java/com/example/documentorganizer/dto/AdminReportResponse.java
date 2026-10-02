package com.example.documentorganizer.dto;

import java.util.Map;

public class AdminReportResponse {

    private long totalUsers;
    private long totalDocuments;
    private long activeUsers;
    private long inactiveUsers;
    private String mostUsedCategory;
    private Map<String, Long> documentsByCategory;
    private Map<String, Long> documentsByFileType;
    private Map<String, Long> documentsByMonth;

    public AdminReportResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public void setTotalDocuments(long totalDocuments) {
        this.totalDocuments = totalDocuments;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public void setInactiveUsers(long inactiveUsers) {
        this.inactiveUsers = inactiveUsers;
    }

    public String getMostUsedCategory() {
        return mostUsedCategory;
    }

    public void setMostUsedCategory(String mostUsedCategory) {
        this.mostUsedCategory = mostUsedCategory;
    }

    public Map<String, Long> getDocumentsByCategory() {
        return documentsByCategory;
    }

    public void setDocumentsByCategory(Map<String, Long> documentsByCategory) {
        this.documentsByCategory = documentsByCategory;
    }

    public Map<String, Long> getDocumentsByFileType() {
        return documentsByFileType;
    }

    public void setDocumentsByFileType(Map<String, Long> documentsByFileType) {
        this.documentsByFileType = documentsByFileType;
    }

    public Map<String, Long> getDocumentsByMonth() {
        return documentsByMonth;
    }

    public void setDocumentsByMonth(Map<String, Long> documentsByMonth) {
        this.documentsByMonth = documentsByMonth;
    }
}
