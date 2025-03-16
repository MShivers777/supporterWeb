export const initializeDebugger = () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const debugContent = document.getElementById('debug-content');

  // Override console.log
  console.log = (...args) => {
    originalConsoleLog.apply(console, args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    
    debugContent.innerHTML += `
      <div class="debug-entry">
        <pre>${new Date().toISOString().split('T')[1].split('.')[0]} | ${message}</pre>
      </div>
    `;
    debugContent.scrollTop = debugContent.scrollHeight;
  };

  // Override console.error
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    
    debugContent.innerHTML += `
      <div class="debug-entry" style="border-left-color: #ff0000;">
        <pre style="color: #ff0000;">ERROR: ${message}</pre>
      </div>
    `;
    debugContent.scrollTop = debugContent.scrollHeight;
  };
};
