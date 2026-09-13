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


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE Event e SET e.availableSeats = e.availableSeats - :seats " +
           "WHERE e.id = :id AND e.availableSeats >= :seats")
    int deductSeatsAtomic(@Param("id") Long id, @Param("seats") int seats);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE Event e SET e.availableSeats = e.availableSeats + :seats " +
           "WHERE e.id = :id AND (e.availableSeats + :seats) <= e.totalSeats")
    int restoreSeatsAtomic(@Param("id") Long id, @Param("seats") int seats);
}