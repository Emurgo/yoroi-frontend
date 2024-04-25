//@flow

import { useParams, useLocation } from 'react-router';

export const withParams = <T>(Component: React$ComponentType<any>): React$ComponentType<T> => {
  // noinspection UnnecessaryLocalVariableJS
  const Wrapper = (props) =>{
    const params = useParams();
    return <Component params={params} {...props}/>
  }
  return Wrapper;
}

export const withLocation = <T>(Component: React$ComponentType<any>): React$ComponentType<T> => {
  // noinspection UnnecessaryLocalVariableJS
  const Wrapper = (props) =>{
    const location: Location = useLocation();
    return <Component location={location} {...props}/>
  }
  return Wrapper;
}

export type Location = {| search: { [string]: string, ... } |};
