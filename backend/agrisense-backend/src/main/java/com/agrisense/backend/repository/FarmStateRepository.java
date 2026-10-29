package com.agrisense.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.FarmState;

public interface FarmStateRepository extends JpaRepository<FarmState, Long> {

	Optional<FarmState> findByFarm(Farm farm);
}