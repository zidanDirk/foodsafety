// 用户初始化组件
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { initializeUser } from '../store/userSlice';

export default function UserInitializer() {
  const dispatch = useAppDispatch();
  const { initialized, isLoading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    // 只在未初始化且未加载时执行初始化
    if (!initialized && !isLoading) {
      dispatch(initializeUser());
    }
  }, [dispatch, initialized, isLoading]);

  // 这个组件不渲染任何UI，只负责初始化用户
  return null;
}
