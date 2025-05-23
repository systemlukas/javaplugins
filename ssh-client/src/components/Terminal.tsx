import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm'; // Renamed to XTerm to avoid conflict with the component name
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'; // Import xterm.css

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstanceRef = useRef<XTerm | null>(null); // To store the xterm instance for cleanup

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    // Ensure only one terminal instance is created
    if (xtermInstanceRef.current) {
        return;
    }

    const xterm = new XTerm({
      cursorBlink: true,
      // You can add theme options here, e.g.:
      // theme: {
      //   background: '#1e1e1e',
      //   foreground: '#d4d4d4',
      //   cursor: '#d4d4d4',
      // }
    });
    xtermInstanceRef.current = xterm; // Store the instance

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit(); // Fit the terminal to the container size

    xterm.write('Hello from xterm.js!\r\n$ ');

    // Optional: Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
      xtermInstanceRef.current = null;
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        width: '100%', 
        height: '400px', // Example height
        border: '1px solid #ccc' // Example border to see its bounds
      }} 
    />
  );
};

export default Terminal;
