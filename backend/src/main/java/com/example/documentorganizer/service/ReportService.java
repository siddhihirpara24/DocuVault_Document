package com.example.documentorganizer.service;

import com.example.documentorganizer.dto.AdminReportResponse;
import com.example.documentorganizer.entity.Document;
import com.example.documentorganizer.entity.UserStatus;
import com.example.documentorganizer.repository.DocumentRepository;
import com.example.documentorganizer.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public ReportService(UserRepository userRepository, DocumentRepository documentRepository) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public AdminReportResponse generateReport() {
        AdminReportResponse report = new AdminReportResponse();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long inactiveUsers = userRepository.countByStatus(UserStatus.INACTIVE);
        long totalDocs = documentRepository.count();

        report.setTotalUsers(totalUsers);
        report.setActiveUsers(activeUsers);
        report.setInactiveUsers(inactiveUsers);
        report.setTotalDocuments(totalDocs);

        // Documents by category
        Map<String, Long> catMap = new LinkedHashMap<>();
        String mostUsedCat = "None";
        long maxCatCount = -1;

        for (Object[] row : documentRepository.countDocumentsByCategory()) {
            String catName = (String) row[0];
            Long count = (Long) row[1];
            catMap.put(catName, count);

            if (count > maxCatCount) {
                maxCatCount = count;
                mostUsedCat = catName;
            }
        }
        report.setDocumentsByCategory(catMap);
        report.setMostUsedCategory(mostUsedCat);

        // Documents by file type
        Map<String, Long> fileTypeMap = new LinkedHashMap<>();
        for (Object[] row : documentRepository.countDocumentsByFileType()) {
            String ext = (String) row[0];
            Long count = (Long) row[1];
            fileTypeMap.put(ext, count);
        }
        report.setDocumentsByFileType(fileTypeMap);

        // Documents by month
        Map<String, Long> monthMap = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        List<Document> allDocs = documentRepository.findAll();
        for (Document d : allDocs) {
            String month = d.getUploadDate().format(formatter);
            monthMap.put(month, monthMap.getOrDefault(month, 0L) + 1L);
        }
        report.setDocumentsByMonth(monthMap);

        return report;
    }
}
