package com.example.documentorganizer.initializer;

import com.example.documentorganizer.entity.Category;
import com.example.documentorganizer.entity.Role;
import com.example.documentorganizer.entity.User;
import com.example.documentorganizer.entity.UserStatus;
import com.example.documentorganizer.repository.CategoryRepository;
import com.example.documentorganizer.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing database with default seed data...");

        // Ensure uploads directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 1. Seed Default Categories
        Map<String, String> defaultCategories = new LinkedHashMap<>();
        defaultCategories.put("Education", "Academic transcripts, marksheets, degree certificates, and grade cards.");
        defaultCategories.put("Identity", "Passport, National ID, Driving License, Voter ID, and citizen credentials.");
        defaultCategories.put("Career", "Resumes, CVs, Offer letters, Experience certificates, and Payslips.");
        defaultCategories.put("Financial", "Bank statements, Tax returns, Investment proofs, and Audit slips.");
        defaultCategories.put("Bills", "Electricity, Internet bills, Rent receipts, and Utility vouchers.");
        defaultCategories.put("Certificates", "Professional accreditations, Training certifications, and Workshop awards.");
        defaultCategories.put("Medical", "Health insurance policies, Prescription notes, and Diagnostic reports.");
        defaultCategories.put("Other", "Miscellaneous personal notes, Warranties, and General documentation.");

        for (Map.Entry<String, String> entry : defaultCategories.entrySet()) {
            if (categoryRepository.findByName(entry.getKey()).isEmpty()) {
                categoryRepository.save(new Category(entry.getKey(), entry.getValue()));
                logger.info("Created default category: {}", entry.getKey());
            }
        }

        // 2. Seed Default Admin Account
        String adminEmail = "admin@gmail.com";
        userRepository.findByEmail(adminEmail).orElseGet(() -> {
            User newAdmin = new User();
            newAdmin.setFullName("Administrator");
            newAdmin.setEmail(adminEmail);
            newAdmin.setPhone("+1-555-0199");
            newAdmin.setPassword(passwordEncoder.encode("Admin@123"));
            newAdmin.setRole(Role.ROLE_ADMIN);
            newAdmin.setStatus(UserStatus.ACTIVE);
            User saved = userRepository.save(newAdmin);
            logger.info("Created default admin user: {} / Admin@123", adminEmail);
            return saved;
        });

        logger.info("Database initialization completed successfully.");
    }
}
