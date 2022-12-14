import styled from 'styled-components'

const Column = styled.div<{
  gap?: string,
  padding?: string,
  alignItems?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  justifyContent?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  width?: string,
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap ?? "0px"};
  padding: ${({ padding }) => padding ?? "0 0 0 0"};;
  width: ${({ width }) => width ?? "auto"};;
  text-align: center;
  /* justify-content: center;
  justify-items: center; */
  align-items: ${({ alignItems }) => alignItems && alignItems};
  justify-content: ${({ justifyContent }) => justifyContent && justifyContent};
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

export default Column
