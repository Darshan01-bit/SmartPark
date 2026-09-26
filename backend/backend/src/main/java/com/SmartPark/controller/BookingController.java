package com.SmartPark.controller;

import com.SmartPark.dto.BookingResponse;
import com.SmartPark.entity.Booking;
import com.SmartPark.entity.Parking;
import com.SmartPark.entity.ParkingSlot;
import com.SmartPark.entity.User;

import com.SmartPark.repository.BookingRepository;
import com.SmartPark.repository.ParkingRepository;
import com.SmartPark.repository.ParkingSlotRepository;
import com.SmartPark.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import java.util.HashMap;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ParkingRepository parkingRepository;
    private final ParkingSlotRepository slotRepository;

    public BookingController(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ParkingRepository parkingRepository,
            ParkingSlotRepository slotRepository) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.parkingRepository = parkingRepository;
        this.slotRepository = slotRepository;
    }

    // CONVERT BOOKING TO RESPONSE
    private BookingResponse convertToResponse(Booking booking) {

        return new BookingResponse(
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus(),

                booking.getParking().getId(),
                booking.getParking().getName(),
                booking.getParking().getLocation(),

                booking.getSlot().getId(),
                booking.getSlot().getSlotNumber()
        );
    }

    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request) {

        // Find user
        User user = userRepository
                .findById(request.userId())
                .orElse(null);

        // Find parking
        Parking parking = parkingRepository
                .findById(request.parkingId())
                .orElse(null);

        // Find slot
        ParkingSlot slot = slotRepository
                .findById(request.slotId())
                .orElse(null);

        // -----------------------------------------------------
        // USER VALIDATION
        // -----------------------------------------------------

        if (user == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "User not found"
                    ));
        }

        // -----------------------------------------------------
        // PARKING VALIDATION
        // -----------------------------------------------------

        if (parking == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Parking not found"
                    ));
        }

        // -----------------------------------------------------
        // SLOT VALIDATION
        // -----------------------------------------------------

        if (slot == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Parking slot not found"
                    ));
        }

        // -----------------------------------------------------
        // CHECK SLOT BELONGS TO SELECTED PARKING
        // -----------------------------------------------------

        if (slot.getParking() == null ||
                !slot.getParking()
                        .getId()
                        .equals(parking.getId())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Selected slot does not belong to this parking"
                    ));
        }

        // -----------------------------------------------------
        // CHECK SLOT AVAILABILITY
        // -----------------------------------------------------

        if (!"AVAILABLE".equalsIgnoreCase(
                slot.getStatus())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Parking slot is not available"
                    ));
        }

        // -----------------------------------------------------
        // TIME VALIDATION
        // -----------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        // Start time is required
        if (request.startTime() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Booking start time is required"
                    ));
        }

        // Start time cannot be in the past
        if (request.startTime().isBefore(now)) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Booking start time cannot be in the past"
                    ));
        }

        // End time is required
        if (request.endTime() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Booking end time is required"
                    ));
        }

        // End time must be after start time
        if (!request.endTime()
                .isAfter(request.startTime())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "End time must be after start time"
                    ));
        }

        // -----------------------------------------------------
        // CREATE BOOKING
        // -----------------------------------------------------

        Booking booking = new Booking();

        booking.setUser(user);
        booking.setParking(parking);
        booking.setSlot(slot);

        booking.setStartTime(
                request.startTime()
        );

        booking.setEndTime(
                request.endTime()
        );

        booking.setStatus("CONFIRMED");

        // -----------------------------------------------------
        // MARK SLOT AS BOOKED
        // -----------------------------------------------------

        slot.setStatus("BOOKED");

        slotRepository.save(slot);

        // -----------------------------------------------------
        // DECREASE AVAILABLE PARKING SLOTS
        // -----------------------------------------------------

        if (parking.getAvailableSlots() > 0) {

        parking.setAvailableSlots(
                parking.getAvailableSlots() - 1
        );

        parkingRepository.save(parking);
        }

        // -----------------------------------------------------
        // SAVE BOOKING
        // -----------------------------------------------------

        Booking savedBooking =
                bookingRepository.save(booking);

        return ResponseEntity.ok(
                convertToResponse(savedBooking)
        );
    }

    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================

    @GetMapping
    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }

    // =========================================================
    // GET BOOKINGS OF A USER
    // =========================================================

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getBookingsByUser(
            @PathVariable Long userId) {

        return bookingRepository
                .findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

        // =========================================================
        // GET ALL COMPLETED BOOKINGS - ADMIN
        // =========================================================

        @GetMapping("/completed")
        public ResponseEntity<?> getCompletedBookings() {

        List<Booking> completedBookings =
                bookingRepository
                        .findByStatusOrderByEndTimeDesc(
                                "COMPLETED"
                        );

        List<Map<String, Object>> response =
                completedBookings.stream()
                        .map(booking -> {

                                Map<String, Object> data =
                                        new HashMap<>();

                                data.put(
                                        "bookingId",
                                        booking.getId()
                                );

                                data.put(
                                        "userName",
                                        booking.getUser() != null
                                                ? booking.getUser().getName()
                                                : "-"
                                );

                                data.put(
                                        "userEmail",
                                        booking.getUser() != null
                                                ? booking.getUser().getEmail()
                                                : "-"
                                );

                                data.put(
                                        "parkingName",
                                        booking.getParking() != null
                                                ? booking.getParking().getName()
                                                : "-"
                                );

                                data.put(
                                        "parkingLocation",
                                        booking.getParking() != null
                                                ? booking.getParking().getLocation()
                                                : "-"
                                );

                                data.put(
                                        "slotNumber",
                                        booking.getSlot() != null
                                                ? booking.getSlot().getSlotNumber()
                                                : "-"
                                );

                                data.put(
                                        "startTime",
                                        booking.getStartTime()
                                );

                                data.put(
                                        "endTime",
                                        booking.getEndTime()
                                );

                                data.put(
                                        "status",
                                        booking.getStatus()
                                );

                                return data;
                        })
                        .toList();

        return ResponseEntity.ok(response);
        }

    // =========================================================
    // GET BOOKING BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long id) {

        return bookingRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // VERIFY BOOKING
    // =========================================================

    @GetMapping("/verify/{id}")
    public ResponseEntity<?> verifyBooking(
            @PathVariable Long id) {

        Booking booking =
                bookingRepository.findById(id)
                        .orElse(null);

        // -----------------------------------------------------
        // BOOKING DOES NOT EXIST
        // -----------------------------------------------------

        if (booking == null) {

            return ResponseEntity
                    .status(404)
                    .body(
                            Map.of(
                                    "valid", false,
                                    "message",
                                    "Booking not found"
                            )
                    );
        }

        // -----------------------------------------------------
        // CHECK BOOKING STATUS
        // -----------------------------------------------------

        if (!"CONFIRMED".equalsIgnoreCase(
                booking.getStatus())) {

            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,
                            "message",
                            "Booking is not active",
                            "bookingId",
                            booking.getId(),
                            "status",
                            booking.getStatus()
                    )
            );
        }

        // -----------------------------------------------------
        // CURRENT SERVER TIME
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();

        // -----------------------------------------------------
        // BOOKING HAS NOT STARTED
        // -----------------------------------------------------

        if (now.isBefore(
                booking.getStartTime())) {

            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,

                            "message",
                            "Booking has not started yet",

                            "bookingId",
                            booking.getId(),

                            "startTime",
                            booking.getStartTime(),

                            "endTime",
                            booking.getEndTime(),

                            "status",
                            booking.getStatus()
                    )
            );
        }

        // -----------------------------------------------------
        // BOOKING HAS EXPIRED
        // -----------------------------------------------------

        if (!now.isBefore(
                booking.getEndTime())) {

            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,

                            "message",
                            "Booking time has expired",

                            "bookingId",
                            booking.getId(),

                            "startTime",
                            booking.getStartTime(),

                            "endTime",
                            booking.getEndTime(),

                            "status",
                            booking.getStatus()
                    )
            );
        }

        // -----------------------------------------------------
        // BOOKING IS CURRENTLY ACTIVE
        // -----------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "valid", true,

                        "message",
                        "Booking verified successfully",

                        "bookingId",
                        booking.getId(),

                        "parkingName",
                        booking.getParking().getName(),

                        "parkingLocation",
                        booking.getParking().getLocation(),

                        "slotNumber",
                        booking.getSlot().getSlotNumber(),

                        "startTime",
                        booking.getStartTime(),

                        "endTime",
                        booking.getEndTime(),

                        "status",
                        booking.getStatus()
                )
        );
    }

        // =========================================================
        // AUTOMATICALLY COMPLETE EXPIRED BOOKINGS
        // =========================================================

        @Scheduled(fixedRate = 60000)
        public void expireBookings() {

        LocalDateTime now = LocalDateTime.now();

        List<Booking> expiredBookings =
                bookingRepository
                        .findByStatusAndEndTimeLessThanEqual(
                                "CONFIRMED",
                                now
                        );

        for (Booking booking : expiredBookings) {

                // -----------------------------------------
                // MARK BOOKING AS COMPLETED
                // -----------------------------------------

                booking.setStatus("COMPLETED");

                bookingRepository.save(booking);

                // -----------------------------------------
                // MAKE SLOT AVAILABLE
                // -----------------------------------------

                ParkingSlot slot = booking.getSlot();

                if (slot != null &&
                        "BOOKED".equalsIgnoreCase(slot.getStatus())) {

                slot.setStatus("AVAILABLE");

                slotRepository.save(slot);
                }

                // -----------------------------------------
                // INCREASE AVAILABLE PARKING SLOTS
                // -----------------------------------------

                Parking parking = booking.getParking();

                if (parking != null) {

                parking.setAvailableSlots(
                        parking.getAvailableSlots() + 1
                );

                parkingRepository.save(parking);
                }
        }
        }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id) {

        Booking booking =
                bookingRepository.findById(id)
                        .orElse(null);

        if (booking == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        ParkingSlot slot =
                booking.getSlot();

        if (slot != null) {

        slot.setStatus("AVAILABLE");

        slotRepository.save(slot);
        }

        // ==========================================
        // INCREASE AVAILABLE PARKING SLOTS
        // ==========================================

        Parking parking =
                booking.getParking();

        if (parking != null) {

        parking.setAvailableSlots(
                parking.getAvailableSlots() + 1
        );

        parkingRepository.save(parking);
        }

        booking.setStatus("CANCELLED");

        bookingRepository.save(booking);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Booking cancelled successfully"
                )
        );
    }

    // =========================================================
    // BOOKING REQUEST
    // =========================================================

    public record BookingRequest(
            Long userId,
            Long parkingId,
            Long slotId,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
    }
}