
package com.SmartPark;

import com.SmartPark.repository.BookingRepository;
import com.SmartPark.repository.ParkingRepository;
import com.SmartPark.repository.ParkingSlotRepository;
import com.SmartPark.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookingRepository bookingRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private ParkingRepository parkingRepository;

    @MockitoBean
    private ParkingSlotRepository parkingSlotRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void getMissingBookingReturnsNotFound() throws Exception {

        when(bookingRepository.findById(999999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/bookings/999999")
                        .with(user("testuser").roles("USER"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
