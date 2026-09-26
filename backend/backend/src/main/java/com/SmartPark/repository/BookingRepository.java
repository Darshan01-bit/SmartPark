package com.SmartPark.repository;

import com.SmartPark.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    // Find confirmed bookings whose end time has passed
    List<Booking> findByStatusAndEndTimeLessThanEqual(
            String status,
            LocalDateTime time
    );

    // Get completed bookings, newest finished booking first
    List<Booking> findByStatusOrderByEndTimeDesc(
            String status
    );
}