import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { budgetAPI, handleApiError, handleApiSuccess } from '../utils/api';

// Initial state
const initialState = {
  budgets: [],
  budgetSummary: null,
  currentBudget: null,
  loading: false,
  error: null,
};

// Action types
const BUDGET_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_BUDGETS: 'SET_BUDGETS',
  SET_BUDGET_SUMMARY: 'SET_BUDGET_SUMMARY',
  SET_CURRENT_BUDGET: 'SET_CURRENT_BUDGET',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const budgetReducer = (state, action) => {
  switch (action.type) {
    case BUDGET_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case BUDGET_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case BUDGET_ACTIONS.SET_BUDGETS:
      return { ...state, budgets: action.payload, loading: false };
    case BUDGET_ACTIONS.SET_BUDGET_SUMMARY:
      return { ...state, budgetSummary: action.payload, loading: false };
    case BUDGET_ACTIONS.SET_CURRENT_BUDGET:
      return { ...state, currentBudget: action.payload, loading: false };
    case BUDGET_ACTIONS.ADD_BUDGET:
      return { 
        ...state, 
        budgets: [action.payload, ...state.budgets],
        loading: false 
      };
    case BUDGET_ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget._id === action.payload._id ? action.payload : budget
        ),
        currentBudget: state.currentBudget?._id === action.payload._id ? action.payload : state.currentBudget,
        loading: false
      };
    case BUDGET_ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget._id !== action.payload),
        currentBudget: state.currentBudget?._id === action.payload ? null : state.currentBudget,
        loading: false
      };
    case BUDGET_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const BudgetContext = createContext();

// Provider component
export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Fetch all budgets
  const fetchBudgets = useCallback(async (params = {}) => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.getAll(params);
      dispatch({ type: BUDGET_ACTIONS.SET_BUDGETS, payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
    }
  }, []);

  // Fetch budget summary
  const fetchBudgetSummary = useCallback(async () => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.getSummary();
      dispatch({ type: BUDGET_ACTIONS.SET_BUDGET_SUMMARY, payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
    }
  }, []);

  // Fetch single budget
  const fetchBudget = useCallback(async (id) => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.getById(id);
      dispatch({ type: BUDGET_ACTIONS.SET_CURRENT_BUDGET, payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
    }
  }, []);

  // Add new budget
  const addBudget = useCallback(async (budgetData) => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.add(budgetData);
      handleApiSuccess(response, 'Budget created successfully');
      dispatch({ type: BUDGET_ACTIONS.ADD_BUDGET, payload: response.data.budget });
      return response.data.budget;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id, budgetData) => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.update(id, budgetData);
      handleApiSuccess(response, 'Budget updated successfully');
      dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: response.data.budget });
      return response.data.budget;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id) => {
    dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await budgetAPI.delete(id);
      handleApiSuccess(response, 'Budget deleted successfully');
      dispatch({ type: BUDGET_ACTIONS.DELETE_BUDGET, payload: id });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get budget by category
  const getBudgetByCategory = useCallback((category) => {
    return state.budgets.find(budget => 
      budget.category === category && budget.isActive
    );
  }, [state.budgets]);

  // Get budgets by period
  const getBudgetsByPeriod = useCallback((period) => {
    return state.budgets.filter(budget => 
      budget.period === period && budget.isActive
    );
  }, [state.budgets]);

  // Get budget alerts
  const getBudgetAlerts = useCallback(() => {
    return state.budgets.filter(budget => 
      budget.isActive && budget.percentageUsed >= budget.alertThreshold
    );
  }, [state.budgets]);

  // Check if budget exists for category
  const budgetExistsForCategory = useCallback((category, period) => {
    return state.budgets.some(budget => 
      budget.category === category && 
      budget.period === period && 
      budget.isActive
    );
  }, [state.budgets]);

  const value = {
    // State
    budgets: state.budgets,
    budgetSummary: state.budgetSummary,
    currentBudget: state.currentBudget,
    loading: state.loading,
    error: state.error,

    // Actions
    fetchBudgets,
    fetchBudgetSummary,
    fetchBudget,
    addBudget,
    updateBudget,
    deleteBudget,
    clearError,

    // Helpers
    getBudgetByCategory,
    getBudgetsByPeriod,
    getBudgetAlerts,
    budgetExistsForCategory,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook to use budget context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export default BudgetContext;