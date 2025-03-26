require "test_helper"

class AisControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ai = ais(:one)
  end

  test "should get index" do
    get ais_url
    assert_response :success
  end

  test "should get new" do
    get new_ai_url
    assert_response :success
  end

  test "should create ai" do
    assert_difference("Ai.count") do
      post ais_url, params: { ai: { generation: @ai.generation } }
    end

    assert_redirected_to ai_url(Ai.last)
  end

  test "should show ai" do
    get ai_url(@ai)
    assert_response :success
  end

  test "should get edit" do
    get edit_ai_url(@ai)
    assert_response :success
  end

  test "should update ai" do
    patch ai_url(@ai), params: { ai: { generation: @ai.generation } }
    assert_redirected_to ai_url(@ai)
  end

  test "should destroy ai" do
    assert_difference("Ai.count", -1) do
      delete ai_url(@ai)
    end

    assert_redirected_to ais_url
  end
end
