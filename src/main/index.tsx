import { h, FunctionalComponent } from "preact";
import { PartialOptions } from '../types/options';

// components
import Table from '../components/Table';

// controller
import useController from './controller';

interface WidgetProps {
  options?: PartialOptions;
}

const Widget: FunctionalComponent<WidgetProps> = ({ options }) => {
  console.log({ options })

  useController(options);

  return (
    <Table options={options} />
  );
}

export default Widget;
