<script lang="javascript">
  import { onMount } from "svelte";

  let messages = [];
  let inputValue = "";
  let nextId = 0;
  let scrollTarget;

  const generateId = () => {
    const id = nextId;
    nextId += 1;
    return id;
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = { id: generateId(), text: inputValue, isUser: true, timestamp: Date.now() };
    const botMessage = { id: generateId(), text: "", isUser: false, timestamp: Date.now() };

    messages = [...messages, userMessage, botMessage];

    const response = await fetch(
      `https://bot.liukonen.dev?text=${encodeURIComponent(inputValue)}`
    );
    const data = await response.json();

    messages = messages.map((message) =>
      message.id === botMessage.id
        ? { ...message, text: data.response }
        : message
    );

    inputValue = "";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  onMount(() => {
    messages = [
      ...messages,
      { text: "Welcome to the chatbot!", isUser: false }
    ];
  });

  const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  };

  $: if (messages && scrollTarget) {
    scrollToBottom(scrollTarget);
  }
</script>

<div class="container-fluid h-100" id="app">
  <div class="row justify-content-center h-100">
    <div class="col-12 card h-100">
      <div class="card-header msg_head">
        <div class="d-flex bd-highlight justify-content-between">
          <div class="user_info">
            <span>River Chatbot</span>
            <p><i id="msgCount">{nextId}</i> Messages</p>
          </div>
          <button
            class="text-light btn"
            aria-label="Info"
            data-bs-toggle="modal"
            data-bs-target="#aboutModal"
          >
            <i class="fa-solid fa-address-card fa-2x" />
		  </button>
        </div>
      </div>
      <div
        class="card-body msg_card_body scr"
        style="overflow: auto;"
        id="dialogue"
        bind:this={scrollTarget}>
        <!-- #scrollMe>-->
        {#each messages as message (message.id)}
           <div class="message {message.isUser ? 'user-message' : ''}">
            <div class="message-text">{message.text}</div>
          </div> 
        {/each}
      </div>

      <div class="card-footer">
        <div class="input-group">
          <span class="input-group-text attach_btn" />
          <input
            class="input-field form-control type_msg"
            aria-label="Input Message"
            placeholder="Type your message..."
            autocomplete="off"
            type="text"
            bind:value={inputValue}
            on:keydown={handleKeyDown}
          />
          <button class="input-group-text send_btn" on:click={handleSubmit}
            ><i class="fas fa-location-arrow" /></button>
        </div>
      </div>
    </div>
  </div>
</div>


<style lang="sass">
$StandardColor: #008bff
$BotResponse: #eee
$StandardResponse: #d0eafb
$Radius : .6em
$ItemBG : #fff

.msg_card_body
	background: #33A2FF

.message
	display: flex
	margin-bottom: 0.5rem

.user-message
	.message-text
		justify-content: flex-end
		background-color: #d0eafb

.message-text
	padding: 0.5rem
	border-radius: 5px
	background-color: $BotResponse
	word-wrap: break-word

.input-field
	flex-grow: 1
	margin-right: 0.25rem

.message
	display: flex
	margin-bottom: 0.5rem

.user-message
	justify-content: flex-end

.card-header
	background-color: $StandardColor

.card-footer
	background-color: $StandardColor

=sharebox
	background-color: $ItemBG !important
	border: 0 !important
	color: black !important

.type_msg
	+sharebox
	height: 60px !important
	overflow-y: auto

.type_msg:focus
	box-shadow: none !important
	outline:0px !important

=sharedButton
	+sharebox
	cursor: pointer

.attach_btn
	border-radius: $Radius 0 0 $Radius !important
	+sharedButton

.send_btn
	border-radius: 0 $Radius $Radius 0 !important
	+sharedButton

.user_info
	span
		font-size: 1.4em
		color: white
	p
		font-size: 0.6em
		color: rgba(255,255,255,0.6)

.msg_head
	position: relative
.scr
	overflow: auto
</style>
