// @ts-ignore
import VConsole from 'vconsole';

// 根据URL参数启用vconsole
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('dev') === '1') {
    new VConsole();
  }
}

export default VConsole;
