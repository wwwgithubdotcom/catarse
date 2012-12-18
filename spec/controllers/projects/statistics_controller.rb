require 'spec_helper'

describe Projects::StatisticsController do
  let(:project) { Factory(:project) }
  subject { response }

  describe 'GET index' do
    before { get :index, project_id: project.id, locale: :pt }

    its(:body) { should == {backer_report:{}, reward_report: {} }.to_json }
  end
end
