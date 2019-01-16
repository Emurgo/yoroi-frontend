// // @flow
// import React from 'react';
// import type { Element } from 'react';
// import classnames from 'classnames';
// import { themr } from 'react-css-themr';
// import { pickDOMProps } from 'react-polymorph/lib/utils/props';
// import Input from 'react-polymorph/lib/components/Input';
// import { INPUT } from 'react-polymorph/lib/skins/simple/identifiers';
// import FormFieldOwnSkin from './FormFieldOwnSkin';

// type Props = {
//   disabled?: boolean,
//   error?: string,
//   label?: string | Element<any>,
//   component: Object,
//   theme: Object,
//   type: string,
//   done?: boolean
// };

// const DefaultProps = {
//   disabled: undefined,
//   error: undefined,
//   label: undefined,
//   done: undefined
// };

// export const inputSkinFactory = (FormFieldSkin: Function) => (
//   (props: Props & typeof DefaultProps) => (
//     <FormFieldSkin
//       input={(type) => (
//         <input
//           {...pickDOMProps(props)}
//           type={type}
//           className={classnames([
//             props.theme.input,
//             props.disabled ? props.theme.disabled : null,
//             props.error ? props.theme.errored : null,
//             (props.error || props.type === 'password' || props.done) ? props.theme.icon : null,
//             ((props.error || props.type === 'password') && props.done)
//                ? props.theme.doubleIcon : null
//           ])}
//           ref={input => props.component.registerSkinPart(Input.SKIN_PARTS.INPUT, input)}
//         />)
//       }
//       {...props}
//     />
//   )
// );

// export default themr(INPUT)(inputSkinFactory(FormFieldOwnSkin));
