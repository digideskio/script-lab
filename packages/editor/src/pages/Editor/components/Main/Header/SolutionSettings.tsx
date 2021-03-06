import React from 'react';
import styled from 'styled-components';

import Only from 'common/lib/components/Only';

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { connect } from 'react-redux';
import { IState as IReduxState } from '../../../store/reducer';
import { actions, selectors } from '../../../store';

const DialogBodyWrapper = styled.div`
  & > * {
    margin-bottom: 1.5rem;
  }
`;

interface ISolutionSettings {
  isOpen: boolean;
  closeSolutionSettings: () => void;
  solution: ISolution;
  editSolutionMetadata: (
    solutionId: string,
    solution: Partial<IEditableSolutionProperties>,
  ) => void;
}

interface IState {
  name: string;
  description: string;
}

class SolutionSettings extends React.Component<ISolutionSettings, IState> {
  state = { name: '', description: '' };

  setupForm = () => {
    const { solution } = this.props;
    const { name } = solution;
    const description = solution.description || '';
    this.setState({ name, description });
  };

  componentWillMount() {
    this.setupForm();
  }

  componentWillReceiveProps() {
    this.setupForm();
  }

  render() {
    const { solution, isOpen, closeSolutionSettings } = this.props;
    const { name, description } = this.state;
    return (
      <Dialog
        hidden={!isOpen}
        onDismiss={closeSolutionSettings}
        dialogContentProps={{ type: DialogType.largeHeader, title: 'Info' }}
        modalProps={{ isBlocking: false }}
      >
        <DialogBodyWrapper>
          <TextField
            data-testid="solution-name-field"
            label="Name"
            onChange={this.updateSolutionName}
            value={name}
          />
          <TextField
            data-testid="solution-desc-field"
            label="Description"
            multiline={true}
            rows={4}
            onChange={this.updateSolutionDescription}
            value={description}
          />
          <Only when={solution.source && solution.source.origin === 'gist'}>
            <div>
              <Label>Gist URL</Label>
              <Link
                target="_blank"
                href={solution.source && `https://gist.github.com/${solution.source.id}`}
              >
                Open in browser
              </Link>
            </div>
          </Only>
        </DialogBodyWrapper>
        <DialogFooter>
          <DefaultButton
            data-testid="cancel"
            text="Cancel"
            secondaryText="Cancels the update to snippet settings"
            onClick={closeSolutionSettings}
          />{' '}
          <PrimaryButton
            data-testid="update"
            text="Update"
            secondaryText="Updates the snippet settings"
            onClick={this.updateSolutionMetadata}
          />
        </DialogFooter>
      </Dialog>
    );
  }
  private updateSolutionName = (
    nevent: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined,
  ) => this.setState({ name: newValue! });

  private updateSolutionDescription = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined,
  ) => this.setState({ description: newValue! });

  private updateSolutionMetadata = () => {
    const { name, description } = this.state;
    this.props.editSolutionMetadata(this.props.solution.id, {
      name,
      description,
    });
    this.props.closeSolutionSettings();
  };
}

export default connect(
  (state: IReduxState) => ({ solution: selectors.editor.getActiveSolution(state) }),
  dispatch => ({
    editSolutionMetadata: (
      solutionId: string,
      solution: Partial<IEditableSolutionProperties>,
    ) => dispatch(actions.solutions.edit({ id: solutionId, solution })),
  }),
)(SolutionSettings);
