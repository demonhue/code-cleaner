import { ReactElement } from 'react';
import CanvasElement from '@sprinklr/modules/processEngine/components/canvasElementRenderer';
import { ElementActionTypes } from '../../hooks/useActionTypes';

import { useNodeConfig } from './nodeConfig';
import { BusinessHoursElement as BusinessHoursElementType } from '../../elementTypes';

interface PropTypes {
  element: BusinessHoursElementType;
  onAction: (params: Spr.Action) => void;
  index: number;
  disabled?: boolean;
}

export const BusinessHoursElement = (props: PropTypes): ReactElement => {
  const { element: BusinessHoursElementType, onAction } = props;
  const nodeConfig = useNodeConfig();

  return (
    <CanvasElement<ElementActionTypes, BusinessHoursElementType>
      element={element}
      nodeBuilderConfig={nodeConfig}
      index={index}
      disabled={disabled}
      onAction={onAction}
    />
  );
};

console.log(BusinessHoursElement);
