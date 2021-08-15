import { IconButton, makeStyles, TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import React, { useCallback } from 'react';

type Props = TextFieldProps & {
  readOnly?: boolean;
};

const useStyles = makeStyles((theme) => ({
  copyButton: {
    margin: theme.spacing(1, 2),
  },
}));

const TextFieldWithCopy: React.FC<Props> = ({
  InputProps,
  readOnly,
  ...restProps
}) => {
  const classes = useStyles();

  const onCopyClicked = useCallback(() => {
    typeof restProps.value === 'string' &&
      navigator.clipboard.writeText(restProps.value);
  }, [restProps.value]);

  const mergedInputProps = {
    ...InputProps,
    readOnly,
    endAdornment: (
      <IconButton
        className={classes.copyButton}
        size="small"
        edge="end"
        color="secondary"
        onClick={onCopyClicked}
      >
        <FileCopyOutlinedIcon />
      </IconButton>
    ),
  };

  return <TextField InputProps={mergedInputProps} {...restProps} />;
};

export default TextFieldWithCopy;
