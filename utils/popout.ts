import { useEffect, useRef, useState } from 'react';

type IWindowProps = {
  url: string;
  title: string;
  width?: number;
  height?: number;
};

type IPopupProps = IWindowProps & {
  onCode: (token: string, verifier: string) => void;
  onError: (message: string) => void;
};

const createPopout = ({ url, title, height, width }: IWindowProps) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const externalPopup = window.open(url, title, `width=${width},height=${height},left=${left},top=${top}`);
  return externalPopup;
};

export default function usePopout({ title = '', width = 500, height = 500, url, onCode, onError }: IPopupProps) {
  const [externalWindow, setExternalWindow] = useState<Window | null>();
  const [windowOpen, setWindowOpen] = useState(false);
  const intervalRef = useRef<number>();

  const clearTimer = () => {
    window.clearInterval(intervalRef.current);
  };

  const openPopout = () => {
    setExternalWindow(
      createPopout({
        url,
        title,
        width,
        height
      })
    );
    setWindowOpen(true);
  };

  useEffect(() => {
    if (externalWindow) {
      intervalRef.current = window.setInterval(() => {
        try {
          if (externalWindow.location.hash.startsWith('#token=&error=')) {
            const params = new URLSearchParams(externalWindow.location.hash.slice(1));
            const error = params.get('error');
            if (error !== 'Token request rejected') onError(error);
            clearTimer();
            externalWindow.close();
            setWindowOpen(false);
            return;
          }

          const currentUrl = externalWindow.location.href;
          const params = new URL(currentUrl).searchParams;
          const token = params.get('oauth_token');
          const verifier = params.get('oauth_verifier');
          if (!token && !verifier) return;
          onCode(token, verifier);
          clearTimer();
          externalWindow.close();
          setWindowOpen(false);
        } catch (error) {
          // eslint-ignore-line
        } finally {
          if (!externalWindow || externalWindow.closed) {
            clearTimer();
            setWindowOpen(false);
          }
        }
      }, 700);
    }
    return () => {
      if (externalWindow) externalWindow.close();
    };
  }, [externalWindow]);

  return [openPopout, windowOpen] as const;
}
