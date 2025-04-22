import { create } from "zustand";

interface AuthModel {
  isOpen: boolean;
  isLogin:boolean
  setIsLogin:(value:boolean)=>void
  onOpen: () => void;
  onClose: () => void;
}

export const useAuthModel = create<AuthModel>((set) => ({
  isOpen: false, // Initial state
  onOpen: () => set({ isOpen: true }), 
  onClose: () => set({ isOpen: false }), 
  isLogin:true,
  setIsLogin:(value:boolean)=>set({isLogin:value})
}));
