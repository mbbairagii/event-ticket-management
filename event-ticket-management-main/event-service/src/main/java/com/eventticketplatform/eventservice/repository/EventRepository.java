package com.eventticketplatform.eventservice.repository;

import com.eventticketplatform.eventservice.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE " +
            "(:name IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(e.venue) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:city IS NULL OR LOWER(e.city) LIKE LOWER(CONCAT('%', :city, '%')) OR LOWER(:city) LIKE LOWER(CONCAT('%', e.city, '%'))) AND " +
            "(:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', :category, '%')) OR LOWER(:category) LIKE LOWER(CONCAT('%', e.category, '%'))) AND " +
            "(:organizerId IS NULL OR e.organizerId = :organizerId)")
    Page<Event> findByFilters(@Param("name") String name,
                              @Param("city") String city,
                              @Param("category") String category,
                              @Param("organizerId") Long organizerId,
                              Pageable pageable);

    @Query("SELECT e.id FROM Event e WHERE e.organizerId = :organizerId")
    List<Long> findIdsByOrganizerId(@Param("organizerId") Long organizerId);

    /**
     * Acquires a pessimistic write lock (SELECT ... FOR UPDATE) on the event row.
     * Prevents race conditions and overselling when multiple users attempt to book
     * the last remaining tickets simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);
}