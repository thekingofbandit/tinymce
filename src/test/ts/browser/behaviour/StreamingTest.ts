import { GeneralSteps, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Streaming } from 'ephox/alloy/api/behaviour/Streaming';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('StreamingTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Streaming.config({
            stream: {
              mode: 'throttle',
              delay: 500
            },
            event: 'click',
            onStream: store.adder('onStream')
          })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input'),
          Step.wait(10)
        ])
      ),

      Step.wait(500),
      store.sAssertEq('Should have only fired one event', [ 'onStream' ]),

      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input'),
          Step.wait(10)
        ])
      ),
      Step.wait(500),
      store.sAssertEq('Should have only fired two events', [ 'onStream', 'onStream' ])
    ];
  }, () => { success(); }, failure);
});