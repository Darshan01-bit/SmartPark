
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private static final Logger log =
            LoggerFactory.getLogger(BookingController.class);

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

    private boolean hasAnotherConfirmedBooking(
            Long slotId,
            Long currentBookingId) {

        return bookingRepository.findAll().stream()
                .anyMatch(other ->
                        other.getId() != null
                        && !other.getId().equals(currentBookingId)
                        && other.getSlot() != null
                        && other.getSlot().getId().equals(slotId)
                        && "CONFIRMED".equalsIgnoreCase(other.getStatus())
                );
    }

    /*
     * Release a booked slot only when no other confirmed booking
     * references it. Increment the parking count only when the
     * slot actually changes from BOOKED to AVAILABLE.
     */
    private void releaseSlotIfNeeded(
            Booking booking,
            boolean checkOtherBookings) {

        ParkingSlot slot = booking.getSlot();
        Parking parking = booking.getParking();

        if (slot == null || parking == null) {
            log.warn("Cannot release slot: booking {} has no slot or parking",
                    booking.getId());
            return;
        }

        if (!"BOOKED".equalsIgnoreCase(slot.getStatus())) {
            log.info("Slot {} is already {}; no count change",
                    slot.getId(), slot.getStatus());
            return;
        }

        Long slotId = slot.getId();

        if (checkOtherBookings
                && hasAnotherConfirmedBooking(slotId, booking.getId())) {
            log.info(
                    "Keeping slot {} booked because another confirmed booking exists",
                    slotId);
            return;
        }

        slot.setStatus("AVAILABLE");
        slotRepository.save(slot);

        int available = parking.getAvailableSlots();
        int total = parking.getTotalSlots();

        parking.setAvailableSlots(
                Math.min(total, available + 1)
        );
        parkingRepository.save(parking);

        log.info("Released slot {} for booking {}; available slots: {}/{}",
                slotId, booking.getId(),
                parking.getAvailableSlots(), total);
    }

    // CREATE BOOKING

    @PostMapping
    @Transactional
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request) {

        if (request.userId() == null
                || request.parkingId() == null
                || request.slotId() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User, parking and slot are required"));
        }

        User user = userRepository.findById(request.userId()).orElse(null);
        Parking parking = parkingRepository.findById(request.parkingId()).orElse(null);
        ParkingSlot slot = slotRepository.findById(request.slotId()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User not found"));
        }

        if (parking == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Parking not found"));
        }

        if (slot == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Parking slot not found"));
        }

        if (slot.getParking() == null
                || !slot.getParking().getId().equals(parking.getId())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Selected slot does not belong to this parking"));
        }

        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Parking slot is not available"));
        }

        if (parking.getAvailableSlots() <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "No parking slots are currently available"));
        }

        LocalDateTime now = LocalDateTime.now();

        if (request.startTime() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Booking start time is required"));
        }

        if (request.startTime().isBefore(now)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Booking start time cannot be in the past"));
        }

        if (request.endTime() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Booking end time is required"));
        }

        if (!request.endTime().isAfter(request.startTime())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "End time must be after start time"));
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setParking(parking);
        booking.setSlot(slot);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus("CONFIRMED");

        slot.setStatus("BOOKED");
        slotRepository.save(slot);

        parking.setAvailableSlots(parking.getAvailableSlots() - 1);
        parkingRepository.save(parking);

        Booking savedBooking = bookingRepository.save(booking);

        log.info("Created booking {} for slot {} ending at {}",
                savedBooking.getId(),
                slot.getSlotNumber(),
                savedBooking.getEndTime());

        return ResponseEntity.ok(convertToResponse(savedBooking));
    }

    // GET ALL BOOKINGS

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET BOOKINGS FOR A USER

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getBookingsByUser(
            @PathVariable Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET COMPLETED BOOKINGS

    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedBookings() {

        List<Booking> completedBookings =
                bookingRepository.findByStatusOrderByEndTimeDesc("COMPLETED");

        List<Map<String, Object>> response = completedBookings.stream()
                .map(booking -> {
                    Map<String, Object> data = new HashMap<>();

                    data.put("bookingId", booking.getId());
                    data.put("userName",
                            booking.getUser() != null
                                    ? booking.getUser().getName() : "-");
                    data.put("userEmail",
                            booking.getUser() != null
                                    ? booking.getUser().getEmail() : "-");
                    data.put("parkingName",
                            booking.getParking() != null
                                    ? booking.getParking().getName() : "-");
                    data.put("parkingLocation",
                            booking.getParking() != null
                                    ? booking.getParking().getLocation() : "-");
                    data.put("slotNumber",
                            booking.getSlot() != null
                                    ? booking.getSlot().getSlotNumber() : "-");
                    data.put("startTime", booking.getStartTime());
                    data.put("endTime", booking.getEndTime());
                    data.put("status", booking.getStatus());

                    return data;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    // GET BOOKING BY ID

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // VERIFY BOOKING

    @GetMapping("/verify/{id}")
    public ResponseEntity<?> verifyBooking(@PathVariable Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.status(404).body(
                    Map.of("valid", false, "message", "Booking not found"));
        }

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,
                            "message", "Booking is not active",
                            "bookingId", booking.getId(),
                            "status", booking.getStatus()));
        }

        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(booking.getStartTime())) {
            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,
                            "message", "Booking has not started yet",
                            "bookingId", booking.getId(),
                            "startTime", booking.getStartTime(),
                            "endTime", booking.getEndTime(),
                            "status", booking.getStatus()));
        }

        if (!now.isBefore(booking.getEndTime())) {
            return ResponseEntity.ok(
                    Map.of(
                            "valid", false,
                            "message", "Booking time has expired",
                            "bookingId", booking.getId(),
                            "startTime", booking.getStartTime(),
                            "endTime", booking.getEndTime(),
                            "status", booking.getStatus()));
        }

        return ResponseEntity.ok(
                Map.of(
                        "valid", true,
                        "message", "Booking verified successfully",
                        "bookingId", booking.getId(),
                        "parkingName", booking.getParking().getName(),
                        "parkingLocation", booking.getParking().getLocation(),
                        "slotNumber", booking.getSlot().getSlotNumber(),
                        "startTime", booking.getStartTime(),
                        "endTime", booking.getEndTime(),
                        "status", booking.getStatus()));
    }

    // AUTOMATICALLY COMPLETE EXPIRED BOOKINGS

    @Scheduled(
            fixedDelay = 60000,
            initialDelay = 10000
    )
    @Transactional
    public void expireBookings() {

        LocalDateTime now = LocalDateTime.now();

        log.info("Booking expiry job running. Application time: {}", now);

        List<Booking> expiredBookings =
                bookingRepository.findByStatusAndEndTimeLessThanEqual(
                        "CONFIRMED", now);

        if (expiredBookings.isEmpty()) {
            log.info("No expired confirmed bookings found.");
            return;
        }

        for (Booking booking : expiredBookings) {

            if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
                continue;
            }

            if (booking.getEndTime() == null
                    || booking.getEndTime().isAfter(now)) {
                continue;
            }

            releaseSlotIfNeeded(booking, true);

            booking.setStatus("COMPLETED");
            bookingRepository.save(booking);

            log.info("Booking {} marked COMPLETED", booking.getId());
        }
    }

    // CANCEL BOOKING

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Only confirmed bookings can be cancelled",
                            "status", booking.getStatus()));
        }

        releaseSlotIfNeeded(booking, true);

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        return ResponseEntity.ok(
                Map.of("message", "Booking cancelled successfully"));
    }

    // BOOKING REQUEST

    public record BookingRequest(
            Long userId,
            Long parkingId,
            Long slotId,
            LocalDateTime startTime,
            LocalDateTime endTime) {
    }
}
