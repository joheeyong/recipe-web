function BookmarksPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px 16px 80px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        저장한 레시피
      </h1>
      <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '60px 0' }}>
        저장한 레시피가 없습니다
      </p>
    </div>
  );
}

export default BookmarksPage;
