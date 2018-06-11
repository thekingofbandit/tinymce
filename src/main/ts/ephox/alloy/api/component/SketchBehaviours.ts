import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Fun } from '@ephox/katamari';

import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { ContainerBehaviours } from '../../spec/SpecSchema';

const field = function (name: string, forbidden: AlloyBehaviour[]): FieldProcessorAdt {
  return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, function (f) {
    return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
  }).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));
};

const get = function (data: ContainerBehaviours): {} {
  return data.dump();
};

export {
  field,
  get
};