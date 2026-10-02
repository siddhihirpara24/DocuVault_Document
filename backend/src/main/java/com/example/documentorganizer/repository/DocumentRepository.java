package com.example.documentorganizer.repository;

import com.example.documentorganizer.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserIdOrderByUploadDateDesc(Long userId);

    List<Document> findTop5ByUserIdOrderByUploadDateDesc(Long userId);

    Optional<Document> findByIdAndUserId(Long id, Long userId);

    List<Document> findByUserIdAndCategoryIdOrderByUploadDateDesc(Long userId, Long categoryId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.user.id = :userId AND d.category.name = :categoryName")
    long countByUserIdAndCategoryName(@Param("userId") Long userId, @Param("categoryName") String categoryName);

    long countByCategoryId(Long categoryId);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(d.documentName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR d.category.id = :categoryId) " +
           "AND (:fileType IS NULL OR :fileType = '' OR LOWER(d.fileType) = LOWER(:fileType)) " +
           "ORDER BY d.uploadDate DESC")
    List<Document> searchUserDocuments(@Param("userId") Long userId,
                                      @Param("keyword") String keyword,
                                      @Param("categoryId") Long categoryId,
                                      @Param("fileType") String fileType);

    @Query("SELECT d FROM Document d WHERE " +
           "(:userId IS NULL OR d.user.id = :userId) " +
           "AND (:categoryId IS NULL OR d.category.id = :categoryId) " +
           "AND (:fileType IS NULL OR :fileType = '' OR LOWER(d.fileType) = LOWER(:fileType)) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(d.documentName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY d.uploadDate DESC")
    List<Document> searchAdminDocuments(@Param("userId") Long userId,
                                       @Param("categoryId") Long categoryId,
                                       @Param("fileType") String fileType,
                                       @Param("keyword") String keyword);

    List<Document> findTop10ByOrderByUploadDateDesc();

    long countByUploadDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(c.name, 'Uncategorized'), COUNT(d.id) FROM Document d LEFT JOIN d.category c GROUP BY c.name")
    List<Object[]> countDocumentsByCategory();

    @Query("SELECT UPPER(d.fileType), COUNT(d.id) FROM Document d GROUP BY UPPER(d.fileType)")
    List<Object[]> countDocumentsByFileType();
}
