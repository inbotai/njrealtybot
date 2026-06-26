export default function TwitterEmbed({ tweetUrl }: { tweetUrl: string }) {
  return (
    <div className="my-8 flex justify-center">
      <iframe
        src={`https://twitframe.com/show?url=${encodeURIComponent(tweetUrl)}`}
        width="100%"
        height="450"
        frameBorder="0"
        scrolling="no"
        style={{ borderRadius: 12, maxWidth: 550 }}
        title="Post on X"
        allowFullScreen
      />
    </div>
  );
}
