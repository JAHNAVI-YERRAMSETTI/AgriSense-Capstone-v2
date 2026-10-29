package com.agrisense.backend.service;

import java.util.List;

import com.agrisense.backend.model.FarmState;

public interface FarmStateService {

    FarmState addFarmState(FarmState farmState);

    List<FarmState> getAllFarmStates();

    FarmState getFarmStateById(Long id);

    FarmState getFarmStateByFarmId(Long farmId);

    FarmState updateFarmState(Long id, FarmState farmState);

    boolean deleteFarmState(Long id);
}