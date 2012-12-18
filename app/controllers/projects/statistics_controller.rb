class Projects::StatisticsController < ApplicationController
  def index
    render json: {
      backer_report: {},
      reward_report: {}
    }
  end
end
