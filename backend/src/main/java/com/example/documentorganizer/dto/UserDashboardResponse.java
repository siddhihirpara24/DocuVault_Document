package com.example.documentorganizer.dto;

import java.util.List;

public class UserDashboardResponse {

    private long totalDocuments;
    private long educationCount;
    private long identityCount;
    private long careerCount;
    private long financialCount;
    private long billsCount;
    private long certificatesCount;
    private long medicalCount;
    private long otherCount;
    private List<DocumentResponse> recentDocuments;

    public UserDashboardResponse() {
    }

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public void setTotalDocuments(long totalDocuments) {
        this.totalDocuments = totalDocuments;
    }

    public long getEducationCount() {
        return educationCount;
    }

    public void setEducationCount(long educationCount) {
        this.educationCount = educationCount;
    }

    public long getIdentityCount() {
        return identityCount;
    }

    public void setIdentityCount(long identityCount) {
        this.identityCount = identityCount;
    }

    public long getCareerCount() {
        return careerCount;
    }

    public void setCareerCount(long careerCount) {
        this.careerCount = careerCount;
    }

    public long getFinancialCount() {
        return financialCount;
    }

    public void setFinancialCount(long financialCount) {
        this.financialCount = financialCount;
    }

    public long getBillsCount() {
        return billsCount;
    }

    public void setBillsCount(long billsCount) {
        this.billsCount = billsCount;
    }

    public long getCertificatesCount() {
        return certificatesCount;
    }

    public void setCertificatesCount(long certificatesCount) {
        this.certificatesCount = certificatesCount;
    }

    public long getMedicalCount() {
        return medicalCount;
    }

    public void setMedicalCount(long medicalCount) {
        this.medicalCount = medicalCount;
    }

    public long getOtherCount() {
        return otherCount;
    }

    public void setOtherCount(long otherCount) {
        this.otherCount = otherCount;
    }

    public List<DocumentResponse> getRecentDocuments() {
        return recentDocuments;
    }

    public void setRecentDocuments(List<DocumentResponse> recentDocuments) {
        this.recentDocuments = recentDocuments;
    }
}
