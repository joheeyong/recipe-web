function OAuthCallbackPage({ provider }) {
  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>{provider} login processing...</p>
    </div>
  );
}

export default OAuthCallbackPage;
