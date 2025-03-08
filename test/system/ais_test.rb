require "application_system_test_case"

class AisTest < ApplicationSystemTestCase
  setup do
    @ai = ais(:one)
  end

  test "visiting the index" do
    visit ais_url
    assert_selector "h1", text: "Ais"
  end

  test "should create ai" do
    visit ais_url
    click_on "New ai"

    fill_in "Generation", with: @ai.generation
    click_on "Create Ai"

    assert_text "Ai was successfully created"
    click_on "Back"
  end

  test "should update Ai" do
    visit ai_url(@ai)
    click_on "Edit this ai", match: :first

    fill_in "Generation", with: @ai.generation
    click_on "Update Ai"

    assert_text "Ai was successfully updated"
    click_on "Back"
  end

  test "should destroy Ai" do
    visit ai_url(@ai)
    click_on "Destroy this ai", match: :first

    assert_text "Ai was successfully destroyed"
  end
end
