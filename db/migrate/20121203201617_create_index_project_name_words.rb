class CreateIndexProjectNameWords < ActiveRecord::Migration
  def up
    execute "CREATE INDEX project_name_words_idx ON project_name_words USING gin(word gin_trgm_ops)"
  end

  def down
  end
end
