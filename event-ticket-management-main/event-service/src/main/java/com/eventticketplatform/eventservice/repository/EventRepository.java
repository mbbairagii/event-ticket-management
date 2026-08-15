package com.eventticketplatform.eventservice.repository;

import com.eventticketplatform.eventservice.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE " +
            "(:name IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:city IS NULL OR LOWER(e.city) = LOWER(:city)) AND " +
            "(:category IS NULL OR LOWER(e.category) = LOWER(:category)) AND " +
            "(:organizerId IS NULL OR e.organizerId = :organizerId)")
    Page<Event> findByFilters(@Param("name") String name,
                              @Param("city") String city,
                              @Param("category") String category,
                              @Param("organizerId") Long organizerId,
                              Pageable pageable);

    @Query("SELECT e.id FROM Event e WHERE e.organizerId = :organizerId")
    java.util.List<Long> findIdsByOrganizerId(@Param("organizerId") Long organizerId);
}