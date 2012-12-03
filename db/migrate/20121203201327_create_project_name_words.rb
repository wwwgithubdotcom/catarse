class CreateProjectNameWords < ActiveRecord::Migration
  def up
    execute "CREATE TABLE project_name_words AS SELECT word FROM ts_stat('SELECT to_tsvector(''simple'', name) FROM projects')"
  end

  def down
    execute "DROP TABLE project_name_words"
  end
end
