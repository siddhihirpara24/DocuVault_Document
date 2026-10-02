package com.example.documentorganizer.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalDocuments;
    private long totalCategories;
    private long documentsUploadedToday;
    private long activeUsers;
    private List<UserResponse> recentUsers;
    private List<DocumentResponse> recentDocuments;
    private Map<String, Long> categoryBreakdown;
    private Map<String, Long> fileTypeBreakdown;

    public AdminDashboardResponse() {
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

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getDocumentsUploadedToday() {
        return documentsUploadedToday;
    }

    public void setDocumentsUploadedToday(long documentsUploadedToday) {
        this.documentsUploadedToday = documentsUploadedToday;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public List<UserResponse> getRecentUsers() {
        return recentUsers;
    }

    public void setRecentUsers(List<UserResponse> recentUsers) {
        this.recentUsers = recentUsers;
    }

    public List<DocumentResponse> getRecentDocuments() {
        return recentDocuments;
    }

    public void setRecentDocuments(List<DocumentResponse> recentDocuments) {
        this.recentDocuments = recentDocuments;
    }

    public Map<String, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<String, Long> getFileTypeBreakdown() {
        return fileTypeBreakdown;
    }

    public void setFileTypeBreakdown(Map<String, Long> fileTypeBreakdown) {
        this.fileTypeBreakdown = fileTypeBreakdown;
    }
}
