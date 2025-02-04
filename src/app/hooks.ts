import type { AppDispatch, RootState } from './store';
// This file serves as a central hub for re-exporting pre-typed Redux hooks.
import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
