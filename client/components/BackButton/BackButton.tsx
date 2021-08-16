import { Button } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useRouter } from 'next/router';
import React from 'react';

type Props = {
  text?: string;
};

const BackButton: React.FC<Props> = ({ text }) => {
  const router = useRouter();
  const backButtonText = text ?? 'Back';

  return (
    <Button
      variant="text"
      startIcon={<ChevronLeftIcon />}
      size="large"
      onClick={() => router.back()}
    >
      {backButtonText}
    </Button>
  );
};

export default BackButton;
