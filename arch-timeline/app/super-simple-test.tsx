export default function SuperSimpleTest() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ff0000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      <h1>🔴 RED SCREEN TEST 🔴</h1>
      <p>If you can see this red screen, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}