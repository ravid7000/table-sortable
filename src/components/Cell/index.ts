import styled from 'styled-components';

import Column from '../../types/column';

interface CellProps extends Column {
  height: string | number;
}

const Cell = styled.div<Partial<CellProps>>(({ width, height, styles, type }) => {
  return {
    display: 'block',
    border: '1px solid #000',
    textAlign: type === 'number' ? 'right' : undefined,
    ...styles,
    height,
    width,
  }
});

export default Cell;
