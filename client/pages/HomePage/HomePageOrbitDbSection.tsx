import React from 'react';
import { useOrbitDb } from '../../context/orbitDb/orbitDbContext';

const HomePageOrbitDbSection = () => {
  const orbitDbContext = useOrbitDb();

  let content: React.ReactElement | undefined = undefined;

  if (orbitDbContext.initError) {
    content = <h4>OrbitDB Init Error</h4>;
  } else if (orbitDbContext.orbitDb) {
    content = (
      <>
        <h4>OrbitDB Initialized</h4>
        <p>ID: {orbitDbContext.orbitDb.id}</p>
      </>
    );
  }

  return (
    <div>
      <h3>OrbitDB Info</h3>
      {content}
    </div>
  );
};

export default HomePageOrbitDbSection;
