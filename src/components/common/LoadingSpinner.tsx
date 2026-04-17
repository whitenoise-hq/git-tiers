import styled from '@emotion/styled';
import { ScaleLoader  } from 'react-spinners';

type TProps = {
  loading: boolean;
}

export const LoadingSpinner = ({
  loading
}: TProps) => {
  return loading && (
    <S.Wrapper>
      <div>
        <ScaleLoader
          width={10}
          height={50}
          radius={6}
          speedMultiplier={0.9}
          color="#EBECF0"
        />
      </div>
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1100;
    background-color: rgba(0, 0, 0, 0.7);
    > div {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  `,
  Inner: styled.div`
    
  `
}