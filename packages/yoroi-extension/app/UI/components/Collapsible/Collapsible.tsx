// @flow
import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Icon } from '../icons/index';
import { IconButton } from '@mui/material';

const Accordion: any = styled(MuiAccordion)(() => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    margin: '0px',
    padding: '0px',
    backgroundColor: 'transparent',
    minHeight: '24px',
    height: '24px',
  },
}));

const AccordionSummary = styled(MuiAccordionSummary)(() => ({
  '& .MuiAccordionSummary-content': {
    margin: '0px',
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(() => ({
  padding: 0,
  paddingTop: '16px',
}));

type Props = {
  title: string;
  content: React.ReactNode;
};

export const Collapsible = ({ title, content }: Props) => {
  const [expanded, setExpanded] = React.useState<any>('none');

  const handleChange = (panel: string | false) => (_: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Accordion disableGutters elevation={0} square expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
      <AccordionSummary
        aria-controls="panel1d-content"
        id="panel1d-header"
        expandIcon={
          <IconButton>
            <Icon.ChevronDown />
          </IconButton>
        }
      >
        <Typography variant="body1" fontWeight="500">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};
